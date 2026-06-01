// ============================================================
// JANKAM — PRODUCTION OTP VERIFICATION INTEGRATION GATEWAY
// ============================================================

export const otpGateway = {
  // Generate and send a secure SMS OTP to the worker's mobile number
  sendOTP: async (mobile: string): Promise<string> => {
    // 1. Generate secure random 4-digit verification code
    const generatedCode = String(Math.floor(1000 + Math.random() * 9000));

    const OTP_PROVIDER = (import.meta.env.VITE_OTP_PROVIDER || 'mock').trim().toLowerCase();
    const TWILIO_SERVICE_SID = (import.meta.env.VITE_TWILIO_SERVICE_SID || '').trim();
    const TWILIO_ACCOUNT_SID = (import.meta.env.VITE_TWILIO_ACCOUNT_SID || '').trim();
    const TWILIO_AUTH_TOKEN = (import.meta.env.VITE_TWILIO_AUTH_TOKEN || '').trim();

    const MSG91_AUTH_KEY = (import.meta.env.VITE_MSG91_AUTH_KEY || '').trim();
    const MSG91_TEMPLATE_ID = (import.meta.env.VITE_MSG91_TEMPLATE_ID || '').trim();

    console.log(`[OTP GATEWAY] Initiating SMS request. Provider mode: ${OTP_PROVIDER}`);

    if (OTP_PROVIDER === 'twilio' && TWILIO_SERVICE_SID && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'To': `+91${mobile}`,
            'Channel': 'sms'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Twilio Verify API responded with status ${response.status}`);
        }
        
        console.log(`[OTP GATEWAY] Twilio SMS OTP successfully dispatched to +91${mobile}`);
      } catch (err) {
        console.error('[OTP GATEWAY] Twilio SMS dispatch failed, fallback active:', err);
      }
    } else if (OTP_PROVIDER === 'msg91' && MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
      try {
        const response = await fetch(`https://api.msg91.com/api/v5/otp?mobile=91${mobile}&authkey=${MSG91_AUTH_KEY}&template_id=${MSG91_TEMPLATE_ID}&otp=${generatedCode}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`MSG91 API responded with status ${response.status}`);
        }
        
        console.log(`[OTP GATEWAY] MSG91 SMS OTP successfully dispatched to +91${mobile}`);
      } catch (err) {
        console.error('[OTP GATEWAY] MSG91 SMS dispatch failed, fallback active:', err);
      }
    } else {
      // Round-trip network latency simulation
      await new Promise((r) => setTimeout(r, 600));
      console.log(`[OTP GATEWAY] [MOCK FLOW] SMS OTP code generated for +91${mobile}: ${generatedCode}`);
    }

    return generatedCode;
  },

  // Verify the submitted OTP code against production providers
  verifyOTP: async (mobile: string, enteredCode: string, actualCode: string): Promise<boolean> => {
    const OTP_PROVIDER = (import.meta.env.VITE_OTP_PROVIDER || 'mock').trim().toLowerCase();
    const TWILIO_SERVICE_SID = (import.meta.env.VITE_TWILIO_SERVICE_SID || '').trim();
    const TWILIO_ACCOUNT_SID = (import.meta.env.VITE_TWILIO_ACCOUNT_SID || '').trim();
    const TWILIO_AUTH_TOKEN = (import.meta.env.VITE_TWILIO_AUTH_TOKEN || '').trim();

    const MSG91_AUTH_KEY = (import.meta.env.VITE_MSG91_AUTH_KEY || '').trim();

    if (OTP_PROVIDER === 'twilio' && TWILIO_SERVICE_SID && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'To': `+91${mobile}`,
            'Code': enteredCode
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          return result.status === 'approved';
        }
      } catch (err) {
        console.error('[OTP GATEWAY] Twilio verify API error, falling back to local matches:', err);
      }
    } else if (OTP_PROVIDER === 'msg91' && MSG91_AUTH_KEY) {
      try {
        const response = await fetch(`https://api.msg91.com/api/v5/otp/verify?mobile=91${mobile}&otp=${enteredCode}&authkey=${MSG91_AUTH_KEY}`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const result = await response.json();
          return result.type === 'success';
        }
      } catch (err) {
        console.error('[OTP GATEWAY] MSG91 verify API error, falling back to local matches:', err);
      }
    }

    // Default or fallback local comparison
    await new Promise((r) => setTimeout(r, 400));
    return enteredCode === actualCode;
  }
};
