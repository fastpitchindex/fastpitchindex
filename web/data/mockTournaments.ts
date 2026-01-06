// Mock tournament data - TODO: Replace with Supabase queries
export type Tournament = {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  city: string | null;
  state: string | null;
  divisions?: string[];
  entryFee?: number;
  orgName?: string;
  sanction?: string;
  level?: string[];
  description?: string | null;
  location?: string | null;
  sourceUrl?: string | null;
  registrationDeadline?: string | null;
  gamesGuaranteed?: string | null;
  updatedAt?: string | null;
};

export const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Michigan Spring Classic",
    startDate: "2024-04-15",
    endDate: "2024-04-17",
    city: "Grand Rapids",
    state: "MI",
    divisions: ["10U", "12U", "14U", "16U"],
    entryFee: 450,
    orgName: "Michigan Fastpitch",
    sanction: "USSSA",
    level: ["A", "B"],
  },
  {
    id: "2",
    name: "Great Lakes Showdown",
    startDate: "2024-05-20",
    endDate: "2024-05-22",
    city: "Lansing",
    state: "MI",
    divisions: ["12U", "14U", "16U", "18U"],
    entryFee: 500,
    orgName: "Great Lakes Sports",
    sanction: "PGF",
    level: ["A"],
  },
  {
    id: "3",
    name: "Summer Slam Tournament",
    startDate: "2024-06-10",
    endDate: "2024-06-12",
    city: "Detroit",
    state: "MI",
    divisions: ["10U", "12U", "14U"],
    entryFee: 425,
    orgName: "Detroit Fastpitch",
    sanction: "Independent",
    level: ["B", "C"],
  },
  {
    id: "4",
    name: "Midwest Championship",
    startDate: "2024-07-05",
    endDate: "2024-07-07",
    city: "Ann Arbor",
    state: "MI",
    divisions: ["14U", "16U", "18U"],
    entryFee: 550,
    orgName: "Midwest Fastpitch",
    sanction: "USSSA",
    level: ["A"],
  },
  {
    id: "5",
    name: "Lake Michigan Classic",
    startDate: "2024-08-15",
    endDate: "2024-08-17",
    city: "Traverse City",
    state: "MI",
    divisions: ["10U", "12U", "14U", "16U"],
    entryFee: 475,
    orgName: "Northern Michigan Sports",
    sanction: "PGF",
    level: ["A", "B"],
  },
  {
    id: "6",
    name: "Fall Finale",
    startDate: "2024-09-20",
    endDate: "2024-09-22",
    city: "Kalamazoo",
    state: "MI",
    divisions: ["12U", "14U", "16U"],
    entryFee: 400,
    orgName: "West Michigan Fastpitch",
    sanction: "USSSA",
    level: ["B", "C"],
  },
];
