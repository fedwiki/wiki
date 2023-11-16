{
  lib,
  config,
  dream2nix,
  ...
}: {
  imports = [
    dream2nix.modules.dream2nix.nodejs-package-lock-v3
    dream2nix.modules.dream2nix.nodejs-granular-v3
  ];

  nodejs-package-lock-v3.packageLockFile = ./package-lock.json;

  deps = {nixpkgs, ...}: {
    inherit
      (nixpkgs)
      fetchFromGitHub
      stdenv
      ;
  };

  name = "wiki";
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

  mkDerivation = {
    src = ./.;
  };
}
