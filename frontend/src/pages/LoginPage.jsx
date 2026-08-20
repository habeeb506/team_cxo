import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { ROUTE_PATHS } from '../constants/routePaths.js';
import useAuth from '../hooks/useAuth.js';

const STEPS = { EMAIL: 'email', OTP: 'otp' };

/**
 * Two-step email-OTP login: enter a work email, then the 6-digit code
 * sent to it. Replaces the old mock "logged in as" dropdown -- there's
 * no password, and success is only possible by proving receipt of the
 * emailed code (see backend/src/services/AuthService.js).
 *
 * Whenever the backend's `otpEchoInResponse` is on (see
 * backend/.env.example -- true by default, including once real SMTP
 * delivery is configured), the request-otp response also includes the
 * code itself plus a `devNote` explaining why; both are shown here as a
 * hint so login can be tested without checking an inbox, whether or not
 * the code was also actually emailed.
 */
export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || ROUTE_PATHS.dashboard;

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [devHint, setDevHint] = useState(null);

  const resetToEmailStep = () => {
    setStep(STEPS.EMAIL);
    setOtp('');
    setError(null);
    setDevHint(null);
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await requestOtp(email);
      setDevHint(result.otp ? `Your code is ${result.otp}${result.devNote ? ` (${result.devNote})` : ''}` : null);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(email, otp);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Sign in to Technet" className="w-full">
      <p className="mb-4 text-sm text-slate-500">
        {step === STEPS.EMAIL
          ? "Enter your work email and we'll send you a one-time login code."
          : `Enter the 6-digit code sent to ${email}.`}
      </p>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      {devHint && (
        <Alert variant="info" className="mb-4">
          {devHint}
        </Alert>
      )}

      {step === STEPS.EMAIL && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send code
          </Button>
        </form>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="6-digit code"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Verify and sign in
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-slate-500 hover:underline"
            onClick={resetToEmailStep}
          >
            Use a different email
          </button>
        </form>
      )}
    </Card>
  );
}
