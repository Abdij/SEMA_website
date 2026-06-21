import { Download, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { getPublications } from "@/lib/db";

export const metadata = {
  title: "Publications",
};

function getPublicationAction(item: { href: string; fileName?: string }) {
  if (item.href.startsWith("http")) {
    return {
      label: "Open source",
      icon: <ExternalLink aria-hidden="true" size={16} />,
      target: "_blank",
    };
  }

  if (item.href.startsWith("/api/publications/file")) {
    return {
      label: item.fileName ? `Download ${item.fileName}` : "Download file",
      icon: <Download aria-hidden="true" size={16} />,
      target: undefined,
    };
  }

  return {
    label: "Open document",
    icon: <Download aria-hidden="true" size={16} />,
    target: undefined,
  };
}

export default async function PublicationsPage() {
  const publications = await getPublications();
  return (
    <>
      <PageHero
        eyebrow="Publications"
        title="Policies, standards, reports, and public information materials."
        text="This library gives users one place to access SEMA documents, treaty reports, national standards, awareness materials, and official external references."
      />
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Document library</p>
              <h2>Available resources</h2>
            </div>
          </div>
          <div className="grid two">
            {publications.map((item) => {
              const action = getPublicationAction(item);

              return (
                <article className="publication-card" key={item.title}>
                  <span className="tag">{item.type}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p className="publication-meta">Source: {item.source}</p>
                  {item.href ? (
                    <a className="text-link" href={item.href} target={action.target} rel="noreferrer">
                      {action.label} {action.icon}
                    </a>
                  ) : (
                    <p className="configuration-note">No downloadable file or source URL has been published yet.</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="band">
        <div className="section-inner content-block">
          <h2>Publishing workflow</h2>
          <p>
            SEMA policies and downloads should be stored in a controlled
            document library, then published with a title, document type, date,
            language, file size, source, and approval status. Supabase Storage,
            Vercel Blob, or another approved object store can be connected when
            the production hosting decision is finalized.
          </p>
        </div>
      </section>
    </>
  );
}
