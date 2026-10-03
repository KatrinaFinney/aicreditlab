'use client';

import { SignIn } from '@clerk/nextjs';
import AuthPageShell from '@/components/AuthPageShell';
import { authAppearance } from '@/lib/clerkAppearance';

export default function SignInPage() {
  return <AuthPageShell mode="sign-in">
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" appearance={authAppearance} />
  </AuthPageShell>;
}
