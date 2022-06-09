import { GuildActions } from "@discord/actions";
import { DiscordModules, WebpackModules } from "@zlibrary";
import { getIconFontSize, getImageLink } from "../modules/utils";
import style from "./guildimage.scss";

const { NavigationUtils } = DiscordModules;
const { getAcronym } = WebpackModules.getByProps("getAcronym");

export default function GuildImage(props) {
	const image = getImageLink(props.guild, props.channel);

	if (image) {
		return (
			<img
				className={style.icon}
				src={image}
				width="48"
				height="48"
				style={{ "border-radius": "16px", cursor: "pointer" }}
				onClick={() => {
					if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
					else if (props.channelPath) NavigationUtils.transitionTo(props.channelPath);
				}}
			/>
		);
	} else {
		return (
			<div
				className={style.defaultIcon}
				onClick={() => {
					if (props.guild) GuildActions.transitionToGuildSync(props.guild.id);
					else if (props.channelPath) NavigationUtils.transitionTo(props.channelPath);
				}}
				style={{ "font-size": `${getIconFontSize(props.guild ? props.guild.name : props.channel.name)}px` }}
			>
				{getAcronym(props.guild ? props.guild.name : props.guild.id)}
			</div>
		);
	}
}
