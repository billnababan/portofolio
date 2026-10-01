import images from "../../data/images.json";

// Responsive <picture> for an image produced by scripts/optimize-images.mjs.
// width/height come from the source file, so the browser reserves space (no CLS).
function imageSrcSet(name, format, maxWidth = Infinity) {
  const meta = images[name];
  return meta.widths
    .filter((w) => w <= maxWidth)
    .map((w) => `/img/${name}-${w}.${meta.v}.${format} ${w}w`)
    .join(", ");
}

export default function Picture({
  name,
  alt,
  sizes,
  className,
  imgClassName,
  loading = "lazy",
  priority = false,
  maxWidth,
}) {
  const meta = images[name];
  const fallback = meta.formats.includes("jpg") ? "jpg" : "webp";
  const widths = meta.widths.filter((w) => w <= (maxWidth ?? Infinity));
  const largest = widths[widths.length - 1];

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={imageSrcSet(name, "avif", maxWidth)} sizes={sizes} />
      {fallback !== "webp" && <source type="image/webp" srcSet={imageSrcSet(name, "webp", maxWidth)} sizes={sizes} />}
      <img
        src={`/img/${name}-${largest}.${meta.v}.${fallback}`}
        srcSet={imageSrcSet(name, fallback, maxWidth)}
        sizes={sizes}
        width={meta.width}
        height={meta.height}
        alt={alt}
        loading={priority ? undefined : loading}
        decoding="async"
        fetchpriority={priority ? "high" : undefined}
        className={imgClassName}
      />
    </picture>
  );
}
