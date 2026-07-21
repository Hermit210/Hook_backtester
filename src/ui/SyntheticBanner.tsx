export function SyntheticBanner() {
  return (
    <div className="synthetic-banner" role="status">
      <span className="synthetic-banner__icon" aria-hidden="true">
        &#9888;
      </span>
      <span>
        <strong>Synthetic data</strong> — for demonstration only. Real Uniswap pool data
        integration is the next milestone.
      </span>
    </div>
  );
}
