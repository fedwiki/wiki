{ config, lib, pkgs, ... }:
let
  cfg = config.services.wiki;
in {
  options.services.wiki = {
    enable = lib.mkEnableOption "wiki";
    package = lib.mkOption {
      type = lib.types.package;
      default = pkgs.wiki;
      defaultText = "pkgs.wiki";
      description = ''
        Which wiki package to use.
      '';
    };
    dataDir = lib.mkOption {
      default = "/var/lib/wiki";
      type = lib.types.str;
    };
    settings = lib.mkOption {
      default = {};
      defaultText = "{}";
      description = ''
        A Nix attribute set of JSON configuration options to pass to the wiki node server
      '';
      type = lib.types.attrs;
    };
  };
  config = let
    configJson = ((pkgs.formats.json {}).generate "wiki-settings.json" cfg.settings);
  in lib.mkIf cfg.enable {
    systemd = {
      services.wiki = {
        description = "Federated Wiki NodeJS Server";
        wantedBy = [ "multi-user.target" ];
        wants = [ "network-online.target" ];
        after = [ "network-online.target" ];
        environment.HOME = "${cfg.dataDir}";
        serviceConfig = {
          Type = "simple";
          ExecStart = "${pkgs.bash}/bin/bash -c '${lib.getExe cfg.package} --config ${builtins.trace (configJson.outPath) configJson}'";
          Restart = "always";
          DynamicUser = true;
          StateDirectory = baseNameOf cfg.dataDir;
        };
      };
    };
  };
}

