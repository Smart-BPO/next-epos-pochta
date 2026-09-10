import { createDeliveryCityPage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createDeliveryCityPage("ru");

export { generateStaticParams, generateMetadata };
export default Page;
