import { createNewsArticlePage } from "@/i18n/create-pages";

const { generateMetadata, generateStaticParams, Page } =
  createNewsArticlePage("uz");
export { generateMetadata, generateStaticParams };
export default Page;
