/**
 * Cabinet chrome reuses the same surface tokens as the dashboard so both
 * authenticated shells feel like one product family — without importing
 * dashboard components (import boundary).
 */
export {
  dashShell as cabShell,
  dashAside as cabAside,
  dashTopBar as cabTopBar,
  dashMainColumn as cabMainColumn,
  dashMainMobilePad as cabMainMobilePad,
  dashPageTitle as cabPageTitle,
  dashPageLead as cabPageLead,
  dashCard as cabCard,
  dashCardPad as cabCardPad,
  dashBtnPrimary as cabBtnPrimary,
  dashBtnSecondary as cabBtnSecondary,
  dashBtnGhost as cabBtnGhost,
  dashLabel as cabLabel,
} from "@/styles/dashboard";
