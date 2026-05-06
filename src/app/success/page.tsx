export default function SuccessPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h1 className="text-2xl font-semibold mb-3">Order confirmed!</h1>
      <p className="text-gray-500 text-sm mb-8">
        Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
        Your piece will be carefully packaged and shipped to you.
      </p>
      <a href="/" className="btn-primary">
        Back to shop
      </a>
    </main>
  );
}
