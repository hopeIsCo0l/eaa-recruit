package com.eaa.recruit.otp;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnExpression("'${MAIL_ENABLED:false}' == 'true' || T(org.springframework.util.StringUtils).hasText('${MAIL_USER:}')")
public class SmtpOtpNotificationAdapter implements OtpNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(SmtpOtpNotificationAdapter.class);

    private final JavaMailSender mailSender;
    private final String         from;
    private final int            ttlSeconds;
    private final String         frontendUrl;

    public SmtpOtpNotificationAdapter(JavaMailSender mailSender,
                                      @Value("${app.mail.from:${spring.mail.username}}") String from,
                                      @Value("${otp.ttl-seconds:300}") int ttlSeconds,
                                      @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl) {
        this.mailSender  = mailSender;
        this.from        = from;
        this.ttlSeconds  = ttlSeconds;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public void send(String recipient, String otp) {
        int expiryMinutes = Math.max(1, ttlSeconds / 60);

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mime, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            String verifyUrl = buildVerifyUrl(recipient, otp);

            helper.setFrom(from);
            helper.setTo(recipient);
            helper.setSubject("EAA Recruit // Verification code " + otp);
            helper.setText(plainTextBody(otp, expiryMinutes, verifyUrl),
                           htmlBody(otp, expiryMinutes, verifyUrl));

            mailSender.send(mime);
            log.info("OTP email dispatched to '{}'", recipient);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to dispatch OTP email to '{}'", recipient, ex);
            throw new OtpNotificationException("Failed to send OTP email", ex);
        }
    }

    // ─── Build the one-click verify URL (frontend auto-fills the OTP form) ──
    private String buildVerifyUrl(String recipient, String otp) {
        String email = URLEncoder.encode(recipient, StandardCharsets.UTF_8);
        String code  = URLEncoder.encode(otp,       StandardCharsets.UTF_8);
        return frontendUrl + "/verify-otp?email=" + email + "&otp=" + code;
    }

    // ─── Plain-text fallback (for clients that block HTML) ──────────────────
    private String plainTextBody(String otp, int expiryMinutes, String verifyUrl) {
        return """
                EAA RECRUIT // VERIFICATION CODE

                Your verification code is:

                    %s

                Or open this link to verify in one click:
                %s

                This code expires in %d minute%s. Enter it on the verification
                page to activate your account.

                Didn't request this? You can safely ignore this email.

                ──
                Compliant with Proclamation No. 1329/2023
                Data stays in Ethiopia
                """.formatted(otp, verifyUrl, expiryMinutes, expiryMinutes == 1 ? "" : "s");
    }

    // ─── HTML body — mirrors the dark IBM-Plex-Mono frontend aesthetic ──────
    private String htmlBody(String otp, int expiryMinutes, String verifyUrl) {
        String digits = renderDigits(otp);
        String expiryLabel = "EXPIRES IN " + expiryMinutes + " MINUTE" + (expiryMinutes == 1 ? "" : "S");

        return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>EAA Recruit — Verification Code</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'IBM Plex Mono','Menlo','Consolas',monospace;color:#F5F5F0;-webkit-text-size-adjust:100%%;">
  <!-- Preheader (hidden, shows as inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0A0A0A;">
    Your EAA Recruit verification code is %s. Expires in %d minute%s.
  </div>

  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%%;background-color:#0D0D0D;border:1px solid #2D2D2D;">

          <!-- ░ Header bar ░ -->
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #1D1D1D;">
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="width:36px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle"
                            style="width:36px;height:36px;background-color:#FFD600;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:11px;color:#0A0A0A;letter-spacing:1px;">
                          EAA
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:11px;color:#F5F5F0;letter-spacing:2px;line-height:1;">EAA RECRUIT</div>
                    <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:#888888;letter-spacing:1px;margin-top:4px;">CANDIDATE VERIFICATION</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ░ Body ░ -->
          <tr>
            <td style="padding:36px 28px 28px 28px;">

              <!-- Bracket label -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td valign="middle" style="padding-right:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#666666;letter-spacing:2px;">
                    [AUTH]
                  </td>
                  <td valign="middle" style="width:3px;height:14px;background-color:#FFD600;font-size:0;line-height:0;">&nbsp;</td>
                  <td valign="middle" style="padding-left:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#AAAAAA;letter-spacing:2px;">
                    VERIFICATION CODE
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 8px 0;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:28px;line-height:1.1;color:#F5F5F0;letter-spacing:-0.5px;">
                Verify your email
              </h1>
              <p style="margin:0 0 28px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#888888;letter-spacing:0.5px;line-height:1.6;">
                Enter the code below to activate your account.
              </p>

              <!-- OTP block -->
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:#0A0A0A;border:1px solid #2D2D2D;margin-bottom:20px;">
                <tr>
                  <td align="center" style="padding:32px 16px 12px 16px;">
                    %s
                  </td>
                </tr>

                <!-- Tap-to-select plain code row (works in every email client — no JS) -->
                <tr>
                  <td align="center" style="padding:4px 16px 16px 16px;">
                    <p style="margin:0 0 8px 0;font-family:'IBM Plex Mono',monospace;font-size:8px;color:#666666;letter-spacing:1.5px;">
                      TAP THE CODE BELOW TO SELECT, THEN COPY
                    </p>
                    <a href="%s"
                       style="display:inline-block;padding:8px 14px;background-color:#1A1A1A;border:1px dashed #2D2D2D;text-decoration:none;font-family:'IBM Plex Mono','Menlo','Consolas',monospace;font-weight:700;font-size:18px;color:#F5F5F0;letter-spacing:6px;user-select:all;-webkit-user-select:all;-moz-user-select:all;">%s</a>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:0 16px 24px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right:8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr><td style="width:6px;height:6px;background-color:#FFD600;font-size:0;line-height:0;border-radius:50%%;">&nbsp;</td></tr>
                          </table>
                        </td>
                        <td valign="middle" style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#FFD600;letter-spacing:2px;font-weight:700;">
                          %s
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- One-click CTA (skips copy entirely — opens verify page with code pre-filled) -->
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="%s"
                       style="display:block;padding:16px 24px;background-color:#FFD600;text-decoration:none;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:11px;color:#0A0A0A;letter-spacing:2px;text-align:center;">
                      VERIFY IN ONE CLICK /
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Body copy -->
              <p style="margin:0 0 16px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.7;color:#AAAAAA;letter-spacing:0.3px;">
                Tap the button above to verify automatically, or paste the code on the verification page if you started registration in another browser.
              </p>
              <p style="margin:0;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.7;color:#666666;letter-spacing:0.3px;">
                Didn't request this? You can safely ignore this email — no account will be created without the code.
              </p>

            </td>
          </tr>

          <!-- ░ Divider ░ -->
          <tr>
            <td style="padding:0 28px;">
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="height:1px;background-color:#1D1D1D;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- ░ Footer ░ -->
          <tr>
            <td style="padding:20px 28px 24px 28px;">
              <p style="margin:0 0 4px 0;font-family:'IBM Plex Mono',monospace;font-size:9px;color:#666666;letter-spacing:1px;line-height:1.7;">
                COMPLIANT WITH PROCLAMATION NO. 1329/2023
              </p>
              <p style="margin:0;font-family:'IBM Plex Mono',monospace;font-size:9px;color:#444444;letter-spacing:1px;line-height:1.7;">
                DATA STAYS IN ETHIOPIA
              </p>
            </td>
          </tr>

        </table>

        <!-- Outer footer -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%%;margin-top:16px;">
          <tr>
            <td align="center" style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:#444444;letter-spacing:1px;line-height:1.6;">
              ETHIOPIAN AVIATION ACADEMY &nbsp;//&nbsp; AUTOMATED MESSAGE &nbsp;//&nbsp; DO NOT REPLY
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
                """.formatted(
                        otp,
                        expiryMinutes, expiryMinutes == 1 ? "" : "s",
                        digits,
                        verifyUrl, otp,
                        expiryLabel,
                        verifyUrl);
    }

    // ─── Render the OTP digits as individual boxed cells (mono-pixel feel) ──
    private String renderDigits(String otp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        sb.append("<tr>");
        for (int i = 0; i < otp.length(); i++) {
            char d = otp.charAt(i);
            sb.append("<td align=\"center\" valign=\"middle\" ")
              .append("style=\"width:44px;height:56px;background-color:#0D0D0D;")
              .append("border:1px solid #2D2D2D;border-top:2px solid #FFD600;")
              .append("font-family:'IBM Plex Mono','Menlo','Consolas',monospace;")
              .append("font-weight:700;font-size:30px;color:#FFD600;letter-spacing:0;\">")
              .append(d)
              .append("</td>");
            if (i < otp.length() - 1) {
                sb.append("<td style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td>");
            }
        }
        sb.append("</tr></table>");
        return sb.toString();
    }
}
