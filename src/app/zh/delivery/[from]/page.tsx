import { createDeliveryCityPage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createDeliveryCityPage("zh");

export { generateStaticParams, generateMetadata };
export default Page;
