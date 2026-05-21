package com.eaa.recruit.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    private Bucket login            = new Bucket(10, 60);
    private Bucket register         = new Bucket(5,  300);
    private Bucket otpSend          = new Bucket(3,  300);
    private Bucket otpResend        = new Bucket(3,  600);
    private Bucket otpVerify        = new Bucket(5,  300);
    private Bucket forgotPassword   = new Bucket(3,  600);

    public Bucket getLogin()           { return login; }
    public Bucket getRegister()        { return register; }
    public Bucket getOtpSend()         { return otpSend; }
    public Bucket getOtpResend()       { return otpResend; }
    public Bucket getOtpVerify()       { return otpVerify; }
    public Bucket getForgotPassword()  { return forgotPassword; }

    public void setLogin(Bucket b)          { this.login = b; }
    public void setRegister(Bucket b)       { this.register = b; }
    public void setOtpSend(Bucket b)        { this.otpSend = b; }
    public void setOtpResend(Bucket b)      { this.otpResend = b; }
    public void setOtpVerify(Bucket b)      { this.otpVerify = b; }
    public void setForgotPassword(Bucket b) { this.forgotPassword = b; }

    public static class Bucket {
        private int max;
        private int windowSeconds;

        public Bucket() {}
        public Bucket(int max, int windowSeconds) {
            this.max = max;
            this.windowSeconds = windowSeconds;
        }

        public int getMax()                          { return max; }
        public int getWindowSeconds()                { return windowSeconds; }
        public void setMax(int max)                  { this.max = max; }
        public void setWindowSeconds(int seconds)    { this.windowSeconds = seconds; }
    }
}
