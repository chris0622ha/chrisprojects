"use client";
import { useState } from "react";
import {
  FOUNDATIONS_ICONS, PRECISION_FLOW_ICONS, WORD_POWER_ICONS, KEYBOARD_MASTERY_ICONS,
  SPEED_SURGE_ICONS, FREE_RUN_ICONS, CENTURY_CLUB_ICONS, ENDURANCE_ICONS,
  LITERATURE_ICONS, MACHINE_MODE_ICONS, LEGEND_TIER_ICONS,
} from "./LevelIcons";
import { ALL_LEVELS } from "./LevelsData";

const SECTION_RANGES = [
  { label: "Foundations", icons: FOUNDATIONS_ICONS, min: 1, max: 15 },
  { label: "Precision Flow", icons: PRECISION_FLOW_ICONS, min: 16, max: 30 },
  { label: "Word Power", icons: WORD_POWER_ICONS, min: 31, max: 45 },
  { label: "Keyboard Mastery", icons: KEYBOARD_MASTERY_ICONS, min: 46, max: 60 },
  { label: "Speed Surge", icons: SPEED_SURGE_ICONS, min: 61, max: 75 },
  { label: "Free Run", icons: FREE_RUN_ICONS, min: 76, max: 99 },
  { label: "Century Club", icons: CENTURY_CLUB_ICONS, min: 100, max: 115 },
  { label: "Endurance", icons: ENDURANCE_ICONS, min: 116, max: 130 },
  { label: "Literature", icons: LITERATURE_ICONS, min: 131, max: 145 },
  { label: "Machine Mode", icons: MACHINE_MODE_ICONS, min: 146, max: 155 },
  { label: "Legend Tier", icons: LEGEND_TIER_ICONS, min: 156, max: 170 },
];

function IconTile({ level, IconComp }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const copyHex = () => {
    navigator.clipboard?.writeText(level.color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div
      onClick={copyHex}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#13131f", border: `1px solid ${hovered ? level.color : "#1e1e30"}`,
        borderRadius: 14, padding: "16px 10px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, cursor: "pointer", transition: "border-color .15s",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 9, color: "#444", position: "absolute", top: 8, left: 10 }}>#{level.id}</div>
      {IconComp ? <IconComp size={36} color={level.color} /> : (
        <div style={{ fontSize: 28 }}>{level.emoji}</div>
      )}
      <div style={{ color: "#ccc", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.3, minHeight: 28 }}>
        {level.name}
      </div>
      <div style={{ fontSize: 9, color: hovered ? level.color : "#555", fontFamily: "'JetBrains Mono',monospace", transition: "color .15s" }}>
        {copied ? "Copied!" : hovered ? level.color : "Hover for hex"}
      </div>
    </div>
  );
}

export default function LevelIconGallery() {
  return (
    <div>
      <div style={{ color: "#666", fontSize: 12, marginBottom: 24, textAlign: "center" }}>
        All 170 level icons — click any tile to copy its hex code
      </div>
      {SECTION_RANGES.map(section => {
        const levels = ALL_LEVELS.filter(l => l.id >= section.min && l.id <= section.max);
        return (
          <div key={section.label} style={{ marginBottom: 36 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{section.label}</div>
            <div style={{ color: "#555", fontSize: 11, marginBottom: 14 }}>
              Levels {section.min}–{section.max} · {levels.length} icons
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
              {levels.map(level => (
                <IconTile key={level.id} level={level} IconComp={section.icons[level.id]} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
