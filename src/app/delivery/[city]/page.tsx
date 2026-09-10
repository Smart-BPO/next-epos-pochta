import { createDeliveryCityPage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createDeliveryCityPage("uz");

export { generateStaticParams, generateMetadata };
export default Page;
