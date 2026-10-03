'use client';

import { SignUp } from '@clerk/nextjs';
import AuthPageShell from '@/components/AuthPageShell';
import { authAppearance } from '@/lib/clerkAppearance';

export default function SignUpPage() {
  return <AuthPageShell mode="sign-up">
    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" appearance={authAppearance} />
  </AuthPageShell>;
}
