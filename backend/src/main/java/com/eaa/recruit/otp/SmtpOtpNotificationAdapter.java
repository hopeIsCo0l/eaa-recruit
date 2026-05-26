package com.eaa.recruit.otp;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpOtpNotificationAdapter implements OtpNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(SmtpOtpNotificationAdapter.class);

    private final JavaMailSender mailSender;
    private final String         from;
    private final int            ttlSeconds;

    public SmtpOtpNotificationAdapter(JavaMailSender mailSender,
                                      @Value("${app.mail.from:${spring.mail.username}}") String from,
                                      @Value("${otp.ttl-seconds:300}") int ttlSeconds) {
        this.mailSender = mailSender;
        this.from       = from;
        this.ttlSeconds = ttlSeconds;
    }

    @Override
    public void send(String recipient, String otp) {
        int expiryMinutes = Math.max(1, ttlSeconds / 60);

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mime, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(from);
            helper.setTo(recipient);
            helper.setSubject("EAA Recruit // Verification code " + otp);
            helper.setText(plainTextBody(otp, expiryMinutes), htmlBody(otp, expiryMinutes));

            mailSender.send(mime);
            log.info("OTP email dispatched to '{}'", recipient);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to dispatch OTP email to '{}'", recipient, ex);
            throw new OtpNotificationException("Failed to send OTP email", ex);
        }
    }

    // ─── Plain-text fallback (for clients that block HTML) ──────────────────
    private String plainTextBody(String otp, int expiryMinutes) {
        return """
                EAA RECRUIT // VERIFICATION CODE

                Your verification code is:

                    %s

                This code expires in %d minute%s. Enter it on the verification
                page to activate your account.

                Didn't request this? You can safely ignore this email.

                ──
                Compliant with Proclamation No. 1329/2023
                Data stays in Ethiopia
                """.formatted(otp, expiryMinutes, expiryMinutes == 1 ? "" : "s");
    }

    // ─── HTML body — mirrors the dark IBM-Plex-Mono frontend aesthetic ──────
    private String htmlBody(String otp, int expiryMinutes) {
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
<body style="margin:0;padding:0;background-color:#F5F5F0;font-family:'IBM Plex Mono','Menlo','Consolas',monospace;color:#0A0A0A;-webkit-text-size-adjust:100%%;">
  <!-- Preheader (hidden, shows as inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5F5F0;">
    Your EAA Recruit verification code is %s. Expires in %d minute%s.
  </div>

  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#F5F5F0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%%;background-color:#FFFFFF;border:1px solid #E5E5E0;">

          <!-- ░ Header bar ░ -->
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #ECECE6;">
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
                    <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:11px;color:#0A0A0A;letter-spacing:2px;line-height:1;">EAA RECRUIT</div>
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
                  <td valign="middle" style="padding-right:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#888888;letter-spacing:2px;">
                    [AUTH]
                  </td>
                  <td valign="middle" style="width:3px;height:14px;background-color:#FFD600;font-size:0;line-height:0;">&nbsp;</td>
                  <td valign="middle" style="padding-left:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#555555;letter-spacing:2px;">
                    VERIFICATION CODE
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 8px 0;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:28px;line-height:1.1;color:#0A0A0A;letter-spacing:-0.5px;">
                Verify your email
              </h1>
              <p style="margin:0 0 28px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#666666;letter-spacing:0.5px;line-height:1.6;">
                Enter the code below to activate your account.
              </p>

              <!-- OTP block -->
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:#FAFAF5;border:1px solid #E5E5E0;margin-bottom:24px;">
                <tr>
                  <td align="center" style="padding:32px 16px 12px 16px;">
                    %s
                  </td>
                </tr>
                <!-- Copy-friendly row: single selectable span. Click once on
                     desktop (user-select:all) or long-press on mobile to copy
                     the full code cleanly without inter-digit spaces. -->
                <tr>
                  <td align="center" style="padding:4px 16px 16px 16px;">
                    <span style="display:inline-block;font-family:'IBM Plex Mono','Menlo','Consolas',monospace;font-size:18px;font-weight:700;color:#0A0A0A;letter-spacing:6px;padding:10px 18px;background-color:#FFFFFF;border:1px dashed #D5D5D0;cursor:copy;-webkit-user-select:all;-moz-user-select:all;-ms-user-select:all;user-select:all;">%s</span>
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
                        <td valign="middle" style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#555555;letter-spacing:2px;font-weight:700;">
                          %s &nbsp;//&nbsp; TAP CODE TO SELECT
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Body copy -->
              <p style="margin:0 0 16px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.7;color:#555555;letter-spacing:0.3px;">
                Open the verification page in the browser tab where you started registration and paste the code above.
              </p>
              <p style="margin:0;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.7;color:#888888;letter-spacing:0.3px;">
                Didn't request this? You can safely ignore this email — no account will be created without the code.
              </p>

            </td>
          </tr>

          <!-- ░ Divider ░ -->
          <tr>
            <td style="padding:0 28px;">
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="height:1px;background-color:#ECECE6;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- ░ Footer ░ -->
          <tr>
            <td style="padding:20px 28px 24px 28px;">
              <p style="margin:0 0 4px 0;font-family:'IBM Plex Mono',monospace;font-size:9px;color:#888888;letter-spacing:1px;line-height:1.7;">
                COMPLIANT WITH PROCLAMATION NO. 1329/2023
              </p>
              <p style="margin:0;font-family:'IBM Plex Mono',monospace;font-size:9px;color:#AAAAAA;letter-spacing:1px;line-height:1.7;">
                DATA STAYS IN ETHIOPIA
              </p>
            </td>
          </tr>

        </table>

        <!-- Outer footer -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%%;margin-top:16px;">
          <tr>
            <td align="center" style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:#999999;letter-spacing:1px;line-height:1.6;">
              ETHIOPIAN AVIATION ACADEMY &nbsp;//&nbsp; AUTOMATED MESSAGE &nbsp;//&nbsp; DO NOT REPLY
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
                """.formatted(otp, expiryMinutes, expiryMinutes == 1 ? "" : "s", digits, otp, expiryLabel);
    }

    // ─── Render the OTP digits as individual boxed cells (mono-pixel feel) ──
    private String renderDigits(String otp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">");
        sb.append("<tr>");
        for (int i = 0; i < otp.length(); i++) {
            char d = otp.charAt(i);
            sb.append("<td align=\"center\" valign=\"middle\" ")
              .append("style=\"width:44px;height:56px;background-color:#FFFFFF;")
              .append("border:1px solid #E5E5E0;border-top:2px solid #FFD600;")
              .append("font-family:'IBM Plex Mono','Menlo','Consolas',monospace;")
              .append("font-weight:700;font-size:30px;color:#0A0A0A;letter-spacing:0;\">")
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
