import { createServiceDetailPage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createServiceDetailPage("zh");

export { generateStaticParams, generateMetadata };
export default Page;
