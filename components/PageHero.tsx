type PageHeroProps = {
  eyebrow?: string;
  title: string;
  text: string;
};

export function PageHero({ eyebrow, title, text }: PageHeroProps) {
  return (
    <section className="page-hero">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
