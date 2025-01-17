import { expectModule, getStore, getClasses } from "@lib/utils/webpack";

const Error = (_props) => (
	<div>
		<h1 style={{ color: "red" }}>Error: Component not found</h1>
	</div>
);

export const SwitchItem = expectModule({
	filter: (m) => m.toString?.().includes("().dividerDefault"),
	searchExports: true,
	name: "SwitchItem",
	fallback: Error,
});

export const roleMention = getClasses("Role Mention Class", ["roleMention"]).roleMention.split(" ")[0];

export const GuildStore = getStore("GuildStore");
