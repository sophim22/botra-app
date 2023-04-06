server "52.77.116.67", user: "deployer", roles: %w{app db web}

namespace :deploy do
  task :precompile do
    on roles :all do
      within release_path do
        execute "cd #{release_path} && #{fetch(:nvm_prefix)} yarn precompile &&#{fetch(:nvm_prefix)} yarn migrate"
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

  before 'deploy:publishing', :precompile
  after 'deploy:publishing', :restart
end
