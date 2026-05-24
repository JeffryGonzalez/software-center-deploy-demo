import { solarAddSquareBold } from '@ng-icons/solar-icons/bold';
import {
  solarBell,
  solarBook,
  solarCalendar,
  solarChartSquare,
  solarCode,
  solarDocument,
  solarFolder,
  solarHome,
  solarLightbulb,
  solarMagnifer,
  solarQuestionCircle,
  solarSettings,
  solarUserCircle,
  solarPin,
  solarStopwatch,
  solarHistory,
  solarTestTube,
} from '@ng-icons/solar-icons/outline';

export const icons = {
  solarBell,
  solarBook,
  solarCalendar,
  solarChartSquare,
  solarCode,
  solarDocument,
  solarFolder,
  solarHome,
  solarLightbulb,
  solarMagnifer,
  solarQuestionCircle,
  solarSettings,
  solarUserCircle,
  solarPin,
  solarStopwatch,
  solarHistory,
  solarTestTube,
  solarAddSquareBold,
} as const;

export type IconName = keyof typeof icons;
