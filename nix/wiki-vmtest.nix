{ nixosTest, pkgs, nixosModule }:
let
  port = 6969;
in
nixosTest {
  name = "wiki";
  nodes = {
    client = { ... }: {
      environment.systemPackages = with pkgs; [ curl ];
    };
    server = { config, ... }: {
      imports = [ nixosModule ];
      networking.firewall.allowedTCPPorts = [ port ];
      services.wiki = {
        enable = true;
        settings = {
          port = toString port;
          host = "0.0.0.0";
          security_legacy = "false";
          home = "test-string";
        };
      };
    };
  };
  testScript = ''
    start_all()
    client.wait_for_unit("multi-user.target")
    server.wait_for_unit("multi-user.target")

    server.wait_for_unit("wiki.service")
    server.wait_for_open_port(${toString port})

    with subtest("Check that the wiki webserver can be reached."):
        client.succeed("curl -sSf http:/server:${toString port} | grep -q 'test-string'")
  '';
}

