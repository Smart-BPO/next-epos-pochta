import type { LucideProps } from "lucide-react";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  MoreHorizontal,
  Newspaper,
  Package,
  Plus,
  Send,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type DashIconProps = {
  className?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
};

function iconProps({
  className,
  strokeWidth = 1.75,
  absoluteStrokeWidth,
}: DashIconProps): LucideProps {
  return {
    className: cn("size-[1.125rem] shrink-0", className),
    strokeWidth,
    absoluteStrokeWidth,
    "aria-hidden": true,
  };
}

export function IconOverview(props: DashIconProps) {
  return <LayoutDashboard {...iconProps(props)} />;
}

export function IconLeads(props: DashIconProps) {
  return <ClipboardList {...iconProps(props)} />;
}

export function IconUsers(props: DashIconProps) {
  return <Users {...iconProps(props)} />;
}

export function IconPackage(props: DashIconProps) {
  return <Package {...iconProps(props)} />;
}

export function IconNews(props: DashIconProps) {
  return <Newspaper {...iconProps(props)} />;
}

export function IconMap(props: DashIconProps) {
  return <Map {...iconProps(props)} />;
}

export function IconSettings(props: DashIconProps) {
  return <Settings {...iconProps(props)} />;
}

export function IconTelegram(props: DashIconProps) {
  return <Send {...iconProps(props)} />;
}

export function IconMedia(props: DashIconProps) {
  return <ImageIcon {...iconProps(props)} />;
}

export function IconStaff(props: DashIconProps) {
  return <UserCog {...iconProps(props)} />;
}

export function IconLogout(props: DashIconProps) {
  return <LogOut {...iconProps(props)} />;
}

export function IconMore(props: DashIconProps) {
  return <MoreHorizontal {...iconProps(props)} />;
}

export function IconPlus(props: DashIconProps) {
  return <Plus {...iconProps(props)} />;
}

export function IconChevron(props: DashIconProps) {
  return <ChevronRight {...iconProps(props)} />;
}

export function IconInbox(props: DashIconProps) {
  return <Inbox {...iconProps(props)} />;
}

export function IconProgress(props: DashIconProps) {
  return <Clock3 {...iconProps(props)} />;
}

export function IconCheck(props: DashIconProps) {
  return <CheckCircle2 {...iconProps(props)} />;
}

export function IconMoney(props: DashIconProps) {
  return <Banknote {...iconProps(props)} />;
}
