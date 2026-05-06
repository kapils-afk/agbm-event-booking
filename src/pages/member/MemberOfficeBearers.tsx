import { api } from "@/lib/api";
import PeopleGrid from "./PeopleGrid";

export default function MemberOfficeBearers() {
  return <PeopleGrid fetcher={api.getOfficeBearers} title="Office Bearers" iconColor="text-red-500" />;
}
