import { defineField, defineType } from "sanity";

const seoFields = [
  defineField({ name: "seoTitle", title: "SEO title", type: "string", validation: rule => rule.max(70) }),
  defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, validation: rule => rule.max(170) }),
  defineField({ name: "ogImage", title: "Social share image", type: "image", options: { hotspot: true } })
];

export const schemaTypes = [
  defineType({ name: "siteSettings", title: "Site settings", type: "document", fields: [
    defineField({ name: "title", title: "Document title", type: "string", initialValue: "Stable & Noble Properties" }),
    defineField({ name: "homeEyebrow", title: "Homepage eyebrow", type: "string" }),
    defineField({ name: "homeHeadlineFirst", title: "Homepage headline — first line", type: "string" }),
    defineField({ name: "homeHeadlineSecond", title: "Homepage headline — second line", type: "string" }),
    defineField({ name: "homeDescription", title: "Homepage description", type: "text", rows: 3 }),
    defineField({ name: "introHeading", title: "Homepage introduction heading", type: "string" }),
    defineField({ name: "introBody", title: "Homepage introduction", type: "text", rows: 5 }),
    defineField({ name: "footerNote", title: "Footer note", type: "text", rows: 3 }),
    ...seoFields
  ]}),
  defineType({ name: "navigation", title: "Navigation", type: "document", fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: rule => rule.required() }),
    defineField({ name: "items", title: "Navigation items", type: "array", of: [{ type: "object", fields: [defineField({ name: "label", title: "Label", type: "string" }), defineField({ name: "href", title: "Link", type: "string" })] }] })
  ]}),
  defineType({ name: "page", title: "Marketing page", type: "document", fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: rule => rule.required() }),
    defineField({ name: "excerpt", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "content", title: "Page content", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    ...seoFields
  ]}),
  defineType({ name: "blogPost", title: "Insight article", type: "document", fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: rule => rule.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({ name: "content", title: "Article content", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "teamMember" }] }),
    defineField({ name: "featuredImage", title: "Featured image", type: "image", options: { hotspot: true } }),
    defineField({ name: "category", title: "Category", type: "string", options: { list: ["Real Estate Investing","Property Analysis","Market Insights","Seller Resources","Renovation","Multifamily","Real Estate Technology"] } }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({ name: "updatedAt", title: "Updated at", type: "datetime" }), ...seoFields
  ]}),
  defineType({ name: "caseStudy", title: "Case study", type: "document", fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "title" }, validation: rule => rule.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "content", title: "Content", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    defineField({ name: "featuredImage", title: "Featured image", type: "image", options: { hotspot: true } }),
    defineField({ name: "market", title: "Market", type: "string" }), ...seoFields
  ]}),
  defineType({ name: "testimonial", title: "Testimonial", type: "document", fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 4 }), defineField({ name: "person", title: "Person", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }), defineField({ name: "approved", title: "Approved for publication", type: "boolean", initialValue: false })
  ]}),
  defineType({ name: "faq", title: "FAQ", type: "document", fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: rule => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "category", title: "Category", type: "string" }), defineField({ name: "sortOrder", title: "Sort order", type: "number" })
  ]}),
  defineType({ name: "teamMember", title: "Team member", type: "document", fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: rule => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string" }), defineField({ name: "bio", title: "Biography", type: "text", rows: 6 }),
    defineField({ name: "photo", title: "Photograph", type: "image", options: { hotspot: true } }), defineField({ name: "approved", title: "Approved for publication", type: "boolean", initialValue: false })
  ]}),
  defineType({ name: "marketPage", title: "Market page", type: "document", fields: [
    defineField({ name: "name", title: "Market name", type: "string", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "name" }, validation: rule => rule.required() }),
    defineField({ name: "isActive", title: "Currently active market", type: "boolean", initialValue: false }),
    defineField({ name: "introduction", title: "Introduction", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "considerations", title: "Investment considerations", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "featuredImage", title: "Featured image", type: "image", options: { hotspot: true } }), ...seoFields
  ]}),
  defineType({ name: "seoSettings", title: "SEO settings", type: "document", fields: [
    defineField({ name: "title", title: "Name", type: "string" }), ...seoFields
  ]})
];
