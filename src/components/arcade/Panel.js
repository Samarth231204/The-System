// Cut-corner panel. variant: 'default' | 'solid'. tight: smaller padding.
export default function Panel({ as: Tag = 'section', variant = 'default', tight = false, className = '', children, ...rest }) {
  const cls = ['sys-panel', variant === 'solid' && 'sys-panel--solid', tight && 'sys-panel--tight', className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
