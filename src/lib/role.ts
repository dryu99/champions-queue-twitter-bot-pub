import RoleLogoJSON from "../ui/assets/role-logos.json";

const RoleLogoData = RoleLogoJSON as Record<Role, { base64: string }>;

export enum Role {
  TOP = "TOP",
  JGL = "JGL",
  MID = "MID",
  BOT = "BOT",
  SUP = "SUP",
}

export const getRoleLogoBase64ByIndex = (roleIndex: number): string => {
  let role: Role;

  switch (roleIndex) {
    case 0:
      role = Role.TOP;
      break;
    case 1:
      role = Role.JGL;
      break;
    case 2:
      role = Role.MID;
      break;
    case 3:
      role = Role.BOT;
      break;
    case 4:
      role = Role.SUP;
      break;
    default:
      role = Role.SUP;
  }

  return RoleLogoData[role]?.base64;
};

export const getRoleLogoBase64ByRole = (role?: Role): string | undefined => {
  if (!role) return undefined;

  return RoleLogoData[role]?.base64;
};
