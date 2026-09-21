import {
  ArrowRight,
  ChartNoAxesColumn,
  Check,
  Clock,
  Droplets,
  Dumbbell,
  Home,
  Leaf,
  Lock,
  Mail,
  Moon,
  Play,
  ShieldCheck,
  UserRound,
  Users,
  Utensils,
  type LucideProps,
} from "lucide-react";

type AppIconProps = Omit<LucideProps, "ref">;

const defaults = {
  size: 20,
  strokeWidth: 1.75,
  "aria-hidden": true as const,
};

function withDefaults(props: AppIconProps): AppIconProps {
  return { ...defaults, ...props };
}

export function IconMail(props: AppIconProps) {
  return <Mail {...withDefaults(props)} />;
}

export function IconShield(props: AppIconProps) {
  return <ShieldCheck {...withDefaults(props)} />;
}

export function IconPerson(props: AppIconProps) {
  return <UserRound {...withDefaults(props)} />;
}

export function IconPair(props: AppIconProps) {
  return <Users {...withDefaults(props)} />;
}

export function IconLeaf(props: AppIconProps) {
  return <Leaf {...withDefaults(props)} />;
}

export function IconArrowRight(props: AppIconProps) {
  return <ArrowRight {...withDefaults(props)} />;
}

export function IconLock(props: AppIconProps) {
  return <Lock {...withDefaults(props)} />;
}

export function IconHome(props: AppIconProps) {
  return <Home {...withDefaults(props)} />;
}

export function IconRoutine(props: AppIconProps) {
  return <Dumbbell {...withDefaults(props)} />;
}

export function IconHabits(props: AppIconProps) {
  return <Droplets {...withDefaults(props)} />;
}

export function IconMoon(props: AppIconProps) {
  return <Moon {...withDefaults(props)} />;
}

export function IconPlay(props: AppIconProps) {
  return <Play {...withDefaults(props)} />;
}

export function IconCheck(props: AppIconProps) {
  return <Check {...withDefaults(props)} />;
}

export function IconClock(props: AppIconProps) {
  return <Clock {...withDefaults(props)} />;
}

export function IconMeal(props: AppIconProps) {
  return <Utensils {...withDefaults(props)} />;
}

export function IconProgress(props: AppIconProps) {
  return <ChartNoAxesColumn {...withDefaults(props)} />;
}
