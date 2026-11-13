// Large display title with the arcade glitch effect.
export default function GlitchTitle({ as: Tag = 'h1', text, className = '', ...rest }) {
  return (
    <Tag className={`sys-glitch ${className}`} data-text={text} {...rest}>
      {text}
    </Tag>
  );
}
