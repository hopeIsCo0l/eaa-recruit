package com.eaa.recruit.otp;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class MockOtpNotificationAdapterTest {

    @Test
    void send_doesNotThrow() {
        MockOtpNotificationAdapter adapter = new MockOtpNotificationAdapter();
        assertThatCode(() -> adapter.send("test@example.com", "123456"))
                .doesNotThrowAnyException();
    }
}
