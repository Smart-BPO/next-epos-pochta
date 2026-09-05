import { createDeliveryRoutePage } from "@/i18n/create-pages";

const { generateStaticParams, generateMetadata, Page } =
  createDeliveryRoutePage("ru");

export { generateStaticParams, generateMetadata };
export default Page;
