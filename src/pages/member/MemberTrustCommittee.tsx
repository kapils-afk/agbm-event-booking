import { api } from "@/lib/api";
import PeopleGrid from "./PeopleGrid";

export default function MemberTrustCommittee() {
  return <PeopleGrid fetcher={api.getTrustCommittee} title="Trust Committee" iconColor="text-teal-500" />;
}
