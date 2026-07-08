import { SignedIn, SignedOut, RedirectToSignIn } from '@neondatabase/auth-ui';

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <h1>Dashboard</h1>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
