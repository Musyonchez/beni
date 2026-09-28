export function Banner({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p className={error ? 'banner-error' : 'banner-success'}>{error || success}</p>
  );
}
