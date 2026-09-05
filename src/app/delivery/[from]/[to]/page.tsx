import { createDeliveryRoutePage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createDeliveryRoutePage("uz");

export { generateStaticParams, generateMetadata };
export default Page;
