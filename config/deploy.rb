set :application, "property-dashboard"
set :deploy_to, "/var/www/#{fetch(:application)}"
set :repo_url, "git@github.com-property:aasatech/property-dashboard.git"

ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

set :linked_files, fetch(:linked_files, []).push('.env', '.nvmrc')
set :linked_dirs, fetch(:linked_dirs, []).push('storages', 'tmp', 'log')
set :keep_releases, 5
set :yarn_flags, ''
set :nvm_node, 'v16.19.0'
set :nvm_map_bins, %w{node npm yarn}
