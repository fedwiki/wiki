{
  description = "FedWiki Client and Server";

  inputs = {
    dream2nix.url = "github:nix-community/dream2nix";
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.follows = "dream2nix/nixpkgs";
  };

  outputs = inputs @ { self, flake-parts, dream2nix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        flake-parts.flakeModules.easyOverlay
      ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      flake = {
        nixosModule = { pkgs, lib, config, ... }: {
          imports = [ ./nix/wiki-module.nix ];
          nixpkgs.overlays = [ self.overlays.default ];
        };
      };
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        overlayAttrs = config.packages // config.legacyPackages;
        checks = {
          wiki = pkgs.callPackage ./nix/wiki-vmtest.nix { nixosModule = self.nixosModule; };
        };
        packages = rec {
          wiki = default;
          default = dream2nix.lib.evalModules {
            packageSets.nixpkgs = inputs.dream2nix.inputs.nixpkgs.legacyPackages.${system};
            modules = [
              ./default.nix
              {
                paths = {
                  projectRoot = ./.;
                  projectRootFile = "flake.nix";
                  package = ./.;
                };
              }
            ];
          };
        };
      };
  };
}
