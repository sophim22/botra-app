server "52.77.116.67", user: "deployer", roles: %w{app db web}

namespace :deploy do
  task :build_asset do
    on roles :all do
      within release_path do
        execute "cd #{release_path} && #{fetch(:nvm_prefix)} yarn build"
      end
    end
  end

  task :restart do
    on roles :all do
      within current_path do
        execute "cd #{current_path} && #{fetch(:nvm_prefix)} pm2 startOrRestart app.json"
      end
    end
  end

  before 'deploy:publishing', :build_asset
  after 'deploy:publishing', :restart
end