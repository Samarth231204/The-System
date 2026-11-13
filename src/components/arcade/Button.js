import Link from 'next/link';

// Cut-corner button. variant: 'default' | 'primary' | 'ghost'.
// Pass href to render a link styled as a button.
export default function Button({ variant = 'default', href, className = '', children, ...rest }) {
  const cls = ['sys-btn', variant !== 'default' && `sys-btn--${variant}`, className].filter(Boolean).join(' ');
  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
