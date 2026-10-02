import Image from "next/image";
import Link from "next/link";
import type { PublicProperty } from "@/lib/properties";

export function PropertyGrid({ properties }: { properties: PublicProperty[] }) {
  if (!properties.length) return null;
  return <div className="property-grid">{properties.map(property=>{
    const image = [...(property.property_images || [])].sort((a,b)=>a.sort_order-b.sort_order)[0];
    return <Link className="property-card" href={`/portfolio/${property.slug}`} key={property.id}><div className="property-card-image">{image ? <Image src={image.url} alt={image.alt_text || `${property.city}, ${property.state} property`} fill sizes="(max-width:760px) 100vw, (max-width:1000px) 50vw, 33vw"/> : <span>S&N / PROPERTY</span>}<i>{property.status.replaceAll("_"," ")}</i></div><div className="property-card-info"><p className="eyebrow">{property.city}, {property.state} · {property.property_type}</p><h3>{property.title}</h3><span>{property.strategy || "Real estate investment"} <b>↗</b></span></div></Link>;
  })}</div>;
}

export function PropertyDetail({ property }: { property: PublicProperty }) {
  const images = [...(property.property_images || [])].sort((a,b)=>a.sort_order-b.sort_order);
  return <><section className="property-detail-hero"><div className="page-wrap">{images[0] && <div className="property-detail-image"><Image src={images[0].url} alt={images[0].alt_text || `${property.title}, ${property.city}`} fill priority sizes="100vw"/></div>}<p className="eyebrow">{property.city}, {property.state} · {property.property_type}</p><h2>{property.title}</h2><span className="property-status">{property.status.replaceAll("_"," ")}</span></div></section><section className="section-pad"><div className="page-wrap property-detail-grid"><div><p className="eyebrow">PROPERTY OVERVIEW</p><h2>A considered<br/><em>opportunity.</em></h2>{property.description && <p className="property-description">{property.description}</p>}</div><div><div className="property-facts">{[["Property type",property.property_type],["Strategy",property.strategy || "—"],["Bedrooms",property.bedrooms ?? "—"],["Bathrooms",property.bathrooms ?? "—"],["Interior area",property.square_feet ? `${property.square_feet.toLocaleString()} sq ft` : "—"]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="fine-print">Property information is provided for general purposes and may change. Verify all details independently.</p><Link href={`/contact?property=${encodeURIComponent(property.title)}`} className="button">Ask about this property <span>↗</span></Link></div></div></section>{images.length>1 && <section className="property-gallery section-pad"><div className="page-wrap"><p className="eyebrow">PROPERTY GALLERY</p><div className="property-gallery-grid">{images.slice(1).map(image=><div key={image.url}><Image src={image.url} alt={image.alt_text || property.title} fill sizes="(max-width:760px) 100vw, 50vw"/></div>)}</div></div></section>}</>;
}
