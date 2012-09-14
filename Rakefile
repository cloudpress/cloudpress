require "rubygems"
require "bundler/setup"
require "stringex"
require "right_aws"
require "digest/md5"
require "mime/types"
require "uri"
require 'pp'
require 'fog' # we need appfog's aws ruby sdk since right_aws doesn't support setting an s3 bucket as a website yet

## -- Rsync Deploy config -- ##
# Be sure your public key is listed in your server's ~/.ssh/authorized_keys file
ssh_user       = "user@domain.com"
ssh_port       = "22"
document_root  = "~/website.com/"
rsync_delete   = true
deploy_default = "rsync"

# This will be configured for you when you run config_deploy
deploy_branch  = "gh-pages"

## -- Misc Configs -- ##

public_dir      = "public"    # compiled site directory
source_dir      = "source"    # source file directory
blog_index_dir  = 'source'    # directory for your blog's index page (if you put your index in source/blog/index.html, set this to 'source/blog')
deploy_dir      = "_deploy"   # deploy directory (for Github pages deployment)
stash_dir       = "_stash"    # directory to stash posts for speedy generation
posts_dir       = "_posts"    # directory for blog files
themes_dir      = ".themes"   # directory for blog files
new_post_ext    = "markdown"  # default new post file extension when using the new_post task
new_page_ext    = "markdown"  # default new page file extension when using the new_page task
server_port     = "4000"      # port for preview server eg. localhost:4000


desc "Initial setup for Octopress: copies the default theme into the path of Jekyll's generator. Rake install defaults to rake install[classic] to install a different theme run rake install[some_theme_name]"
task :install, :theme do |t, args|
  if File.directory?(source_dir) || File.directory?("sass")
    abort("rake aborted!") if ask("A theme is already installed, proceeding will overwrite existing files. Are you sure?", ['y', 'n']) == 'n'
  end
  # copy theme into working Jekyll directories
  theme = args.theme || 'classic'
  puts "## Copying "+theme+" theme into ./#{source_dir} and ./sass"
  mkdir_p source_dir
  cp_r "#{themes_dir}/#{theme}/source/.", source_dir
  mkdir_p "sass"
  cp_r "#{themes_dir}/#{theme}/sass/.", "sass"
  mkdir_p "#{source_dir}/#{posts_dir}"
  mkdir_p public_dir
end

#######################
# Working with Jekyll #
#######################

desc "Generate jekyll site"
task :generate do
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  puts "## Generating Site with Jekyll"
  system "compass compile --css-dir #{source_dir}/stylesheets"
  system "jekyll"
end

desc "Watch the site and regenerate when it changes"
task :watch do
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  puts "Starting to watch source with Jekyll and Compass."
  system "compass compile --css-dir #{source_dir}/stylesheets" unless File.exist?("#{source_dir}/stylesheets/screen.css")
  jekyllPid = Process.spawn({"OCTOPRESS_ENV"=>"preview"}, "jekyll --auto")
  compassPid = Process.spawn("compass watch")

  trap("INT") {
    [jekyllPid, compassPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, compassPid].each { |pid| Process.wait(pid) }
end

desc "preview the site in a web browser"
task :preview do
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  puts "Starting to watch source with Jekyll and Compass. Starting Rack on port #{server_port}"
  system "compass compile --css-dir #{source_dir}/stylesheets" unless File.exist?("#{source_dir}/stylesheets/screen.css")
  jekyllPid = Process.spawn({"OCTOPRESS_ENV"=>"preview"}, "jekyll --auto")
  compassPid = Process.spawn("compass watch")
  rackupPid = Process.spawn("rackup --port #{server_port}")

  trap("INT") {
    [jekyllPid, compassPid, rackupPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [jekyllPid, compassPid, rackupPid].each { |pid| Process.wait(pid) }
end

# usage rake new_post[my-new-post] or rake new_post['my new post'] or rake new_post (defaults to "new-post")
desc "Begin a new post in #{source_dir}/#{posts_dir}"
task :new_post, :title do |t, args|
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  mkdir_p "#{source_dir}/#{posts_dir}"
  args.with_defaults(:title => 'new-post')
  title = args.title
  filename = "#{source_dir}/#{posts_dir}/#{Time.now.strftime('%Y-%m-%d')}-#{title.to_url}.#{new_post_ext}"
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end
  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: post"
    post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
    post.puts "date: #{Time.now.strftime('%Y-%m-%d %H:%M')}"
    post.puts "comments: true"
    post.puts "categories: "
    post.puts "---"
  end
end

# usage rake new_page[my-new-page] or rake new_page[my-new-page.html] or rake new_page (defaults to "new-page.markdown")
desc "Create a new page in #{source_dir}/(filename)/index.#{new_page_ext}"
task :new_page, :filename do |t, args|
  raise "### You haven't set anything up yet. First run `rake install` to set up an Octopress theme." unless File.directory?(source_dir)
  args.with_defaults(:filename => 'new-page')
  page_dir = [source_dir]
  if args.filename.downcase =~ /(^.+\/)?(.+)/
    filename, dot, extension = $2.rpartition('.').reject(&:empty?)         # Get filename and extension
    title = filename
    page_dir.concat($1.downcase.sub(/^\//, '').split('/')) unless $1.nil?  # Add path to page_dir Array
    if extension.nil?
      page_dir << filename
      filename = "index"
    end
    extension ||= new_page_ext
    page_dir = page_dir.map! { |d| d = d.to_url }.join('/')                # Sanitize path
    filename = filename.downcase.to_url

    mkdir_p page_dir
    file = "#{page_dir}/#{filename}.#{extension}"
    if File.exist?(file)
      abort("rake aborted!") if ask("#{file} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
    end
    puts "Creating new page: #{file}"
    open(file, 'w') do |page|
      page.puts "---"
      page.puts "layout: page"
      page.puts "title: \"#{title}\""
      page.puts "date: #{Time.now.strftime('%Y-%m-%d %H:%M')}"
      page.puts "comments: true"
      page.puts "sharing: true"
      page.puts "footer: true"
      page.puts "---"
    end
  else
    puts "Syntax error: #{args.filename} contains unsupported characters"
  end
end

# usage rake isolate[my-post]
desc "Move all other posts than the one currently being worked on to a temporary stash location (stash) so regenerating the site happens much quicker."
task :isolate, :filename do |t, args|
  stash_dir = "#{source_dir}/#{stash_dir}"
  FileUtils.mkdir(stash_dir) unless File.exist?(stash_dir)
  Dir.glob("#{source_dir}/#{posts_dir}/*.*") do |post|
    FileUtils.mv post, stash_dir unless post.include?(args.filename)
  end
end

desc "Move all stashed posts back into the posts directory, ready for site generation."
task :integrate do
  FileUtils.mv Dir.glob("#{source_dir}/#{stash_dir}/*.*"), "#{source_dir}/#{posts_dir}/"
end

desc "Clean out caches: .pygments-cache, .gist-cache, .sass-cache"
task :clean do
  rm_rf [".pygments-cache/**", ".gist-cache/**", ".sass-cache/**", "source/stylesheets/screen.css"]
end

desc "Move sass to sass.old, install sass theme updates, replace sass/custom with sass.old/custom"
task :update_style, :theme do |t, args|
  theme = args.theme || 'classic'
  if File.directory?("sass.old")
    puts "removed existing sass.old directory"
    rm_r "sass.old", :secure=>true
  end
  mv "sass", "sass.old"
  puts "## Moved styles into sass.old/"
  cp_r "#{themes_dir}/"+theme+"/sass/", "sass"
  cp_r "sass.old/custom/.", "sass/custom"
  puts "## Updated Sass ##"
end

desc "Move source to source.old, install source theme updates, replace source/_includes/navigation.html with source.old's navigation"
task :update_source, :theme do |t, args|
  theme = args.theme || 'classic'
  if File.directory?("#{source_dir}.old")
    puts "## Removed existing #{source_dir}.old directory"
    rm_r "#{source_dir}.old", :secure=>true
  end
  mkdir "#{source_dir}.old"
  cp_r "#{source_dir}/.", "#{source_dir}.old"
  puts "## Copied #{source_dir} into #{source_dir}.old/"
  cp_r "#{themes_dir}/"+theme+"/source/.", source_dir, :remove_destination=>true
  cp_r "#{source_dir}.old/_includes/custom/.", "#{source_dir}/_includes/custom/", :remove_destination=>true
  cp "#{source_dir}.old/favicon.png", source_dir
  mv "#{source_dir}/index.html", "#{blog_index_dir}", :force=>true if blog_index_dir != source_dir
  cp "#{source_dir}.old/index.html", source_dir if blog_index_dir != source_dir && File.exists?("#{source_dir}.old/index.html")
  puts "## Updated #{source_dir} ##"
end

##############
# Deploying  #
##############

desc "Default deploy task"
task :deploy do
  # Check if preview posts exist, which should not be published
  if File.exists?(".preview-mode")
    puts "## Found posts in preview mode, regenerating files ..."
    File.delete(".preview-mode")
    Rake::Task[:generate].execute
  end

  Rake::Task[:copydot].invoke(source_dir, public_dir)
  Rake::Task["#{deploy_default}"].execute
end

desc "Generate website and deploy"
task :gen_deploy => [:integrate, :generate, :deploy] do
end

desc "copy dot files for deployment"
task :copydot, :source, :dest do |t, args|
  FileList["#{args.source}/**/.*"].exclude("**/.", "**/..", "**/.DS_Store", "**/._*").each do |file|
    cp_r file, file.gsub(/#{args.source}/, "#{args.dest}") unless File.directory?(file)
  end
end

desc "Deploy website via rsync"
task :rsync do
  exclude = ""
  if File.exists?('./rsync-exclude')
    exclude = "--exclude-from '#{File.expand_path('./rsync-exclude')}'"
  end
  puts "## Deploying website via Rsync"
  ok_failed system("rsync -avze 'ssh -p #{ssh_port}' #{exclude} #{"--delete" unless rsync_delete == false} #{public_dir}/ #{ssh_user}:#{document_root}")
end

namespace :aws do

  def get_s3_bucket_by_parsing__host_from_url()
    config = YAML::load(File.open('_config.yml'))
    url = config['url']
    uri = URI.parse(url)
    host = uri.host

    if !host.match(/^www\./)
      raise 'url in _config.yml must start with www.'
    end

    return host
  end

  def create_s3_facade()
    logger = Logger.new(STDOUT)
    logger.level = Logger::WARN
    config = YAML::load(File.open('_config.yml'))

    s3 = RightAws::S3.new(config['aws_access_key_id'], config['aws_secret_access_key'], { :logger => logger })

    return s3
  end

  def create_cloudfront_facade()
    logger = Logger.new(STDOUT)
    logger.level = Logger::WARN
    config = YAML::load(File.open('_config.yml'))

    acf = RightAws::AcfInterface.new(config['aws_access_key_id'], config['aws_secret_access_key'], { :logger => logger })

    return acf
  end

  def create_appfog_s3_facade()
    config = YAML::load(File.open('_config.yml'))

    # TODO: consider other regions as a config option
    storage = Fog::Storage.new({
                                   :provider   => 'AWS',
                                   :aws_access_key_id => config['aws_access_key_id'],
                                   :aws_secret_access_key => config['aws_secret_access_key'],
                                   :region => 'us-east-1'
                               })
    return storage
  end

  def create_route_53_facade()
    config = YAML::load(File.open('_config.yml'))
    logger = Logger.new(STDOUT)
    logger.level = Logger::WARN

    route53 = RightAws::Route53Interface.new(config['aws_access_key_id'], config['aws_secret_access_key'], { :logger => logger })

    return route53
  end

  def create_bucket_as_website(s3_bucket)
    puts "## Creating S3 Bucket"

    s3 = create_s3_facade()
    s3.bucket(s3_bucket, true, 'public-read')

    storage = create_appfog_s3_facade()
    storage.put_bucket_website(s3_bucket, "index.html", :key => "404.html")

    puts "\n## Amazon S3 Bucket Creation Complete"
  end

  def retrieve_s3_bucket(s3_bucket)
    s3 = create_s3_facade()
    return s3.bucket(s3_bucket, true, 'public-read')
  end
  
  def deploy_modified_files_to_s3_and_return_list_of_paths_to_invalidate(public_dir)
    s3_bucket = get_s3_bucket_by_parsing__host_from_url()
    paths_to_invalidate = []
    any_files_deployed = false

    bucket = retrieve_s3_bucket(s3_bucket)

    puts 'Calculating modified files between local disk and s3.  This may take a minute...'

    Dir.glob("#{public_dir}/**/*").each do |file|
      if File.file?(file)

        remote_file = file.gsub("#{public_dir}/", "")
        key = bucket.key(remote_file, true)

        if !key || (key.e_tag != ("\"" + Digest::MD5.hexdigest(File.read(file))) + "\"")
          puts "Deploying file #{remote_file}"

          bucket.put(key, open(file), {}, 'public-read', {
            'content-type'        => MIME::Types.type_for(file).first.to_s,
            'x-amz-storage-class' => 'REDUCED_REDUNDANCY'
          })

          any_files_deployed = true

          paths_to_invalidate << "/#{remote_file}"
        end
      end
    end

    if(!any_files_deployed) then
      puts 'No Files Changed.  Your blog is already up to date.'
      exit
    end

    return paths_to_invalidate
  end

  def s3_bucket_exists(acf)
    acf = create_cloudfront_facade()
    distributions = acf.list_distributions

    s3_bucket = get_s3_bucket_by_parsing__host_from_url()
    distribution = get_distribution_that_matches_s3_bucket_from_list_of_distributions(s3_bucket, distributions)

    return distribution != nil
  end

  def get_distribution_that_matches_s3_bucket_from_list_of_distributions(s3_bucket, distributions)
    distributions.each { |distribution|
      if(distribution[:cnames] != nil && distribution[:cnames].include?(s3_bucket)) then
        return distribution
      end
    }

    raise 'matching distribution not found'
  end
  
  def create_cloudfront_distribution_or_return_existing(acf, found_bucket_cname)
    distributions = acf.list_distributions

    s3_bucket = get_s3_bucket_by_parsing__host_from_url()

    distribution = get_distribution_that_matches_s3_bucket_from_list_of_distributions(s3_bucket, distributions)

    if (!found_bucket_cname) then
      puts "Creating Amazon CloudFront distribution."
      config = {
        :enabled              => true,
        :comment              => "http://#{s3_bucket}",
        :cnames               => [ s3_bucket ],
        :s3_origin            => {
          :dns_name           => "#{s3_bucket}.s3.amazonaws.com"
        },
        :default_root_object  => 'index.html'
      }
      distributionID = acf.create_distribution(config)[:aws_id]

      while (acf.get_distribution(distributionID)[:status] == 'InProgress')
        puts "Waiting for CloudFront distribution to populate all cdn caches.  This can take several minutes to complete.  Will check again in 60 seconds..."
        sleep 60
      end

      puts "Distribution #{distributionID} created and ready to serve your blog"
    end

    return distribution
  end

  def strip_www_dot_from_front_of_s3_bucket()
    s3_bucket = get_s3_bucket_by_parsing__host_from_url()
    s3_bucket_without_www_dot = s3_bucket.gsub(/www\./, '')

    return s3_bucket_without_www_dot
  end

  def create_route_53_hosted_zone()
    puts 'Creating Route53 Hosted Zone And Resource Record Sets'

    route53 = create_route_53_facade()

    s3_bucket_without_www_dot = strip_www_dot_from_front_of_s3_bucket()

    create_hosted_zone_response_hash = route53.create_hosted_zone({:name   => s3_bucket_without_www_dot + '.'})

    hosted_zone_id = create_hosted_zone_response_hash[:aws_id]

    puts 'These are the four fully qualified domain names you need to enter into your domain registrars nameserver settings for your domain:'

    list_of_name_servers = create_hosted_zone_response_hash[:name_servers]

    list_of_name_servers.each { |name_server|
      puts name_server
    }

    return hosted_zone_id
  end
  
  def invalidate_modified_cloudfront_paths(distribution, paths_to_invalidate, acf)
    if (paths_to_invalidate != nil && !paths_to_invalidate.empty?) then
      puts "Invalidating CloudFront caches"

      acf.create_invalidation distribution[:aws_id], :path => paths_to_invalidate
    end
  end

  def create_route_53_resource_record_sets(hosted_zone_id, cloudfront_distribution_url)
    route53 = create_route_53_facade()
    s3_bucket = get_s3_bucket_by_parsing__host_from_url()
    s3_bucket_without_www_dot = strip_www_dot_from_front_of_s3_bucket()

    resource_record_sets = [ { :name => s3_bucket + '.',
                               :type => 'CNAME',
                               :ttl => 600,
                               :resource_records => cloudfront_distribution_url },
                             { :name => s3_bucket_without_www_dot + '.',
                               :type => 'A',
                               :ttl => 600,
                               :resource_records => ['174.129.25.170'] # use wwwizer to redirect to www
                             }
                           ]

    route53.create_resource_record_sets(hosted_zone_id, resource_record_sets)
  end

  desc "Deploy website to Amazon CloudFront"
  task :cloudfront do
    acf = create_cloudfront_facade()
    found_bucket_cname = s3_bucket_exists(acf)
    distribution = create_cloudfront_distribution_or_return_existing(acf, found_bucket_cname)
    #paths_to_invalidate = deploy_modified_files_to_s3_and_return_list_of_paths_to_invalidate(public_dir)
    #invalidate_modified_cloudfront_paths(distribution, paths_to_invalidate, acf)

    #if(!found_bucket_cname) then
      hosted_zone_id = create_route_53_hosted_zone()
      create_route_53_resource_record_sets(hosted_zone_id, distribution[:domain_name])
    #end
  end
end

desc "deploy public directory to github pages"
multitask :push do
  puts "## Deploying branch to Github Pages "
  (Dir["#{deploy_dir}/*"]).each { |f| rm_rf(f) }
  Rake::Task[:copydot].invoke(public_dir, deploy_dir)
  puts "\n## copying #{public_dir} to #{deploy_dir}"
  cp_r "#{public_dir}/.", deploy_dir
  cd "#{deploy_dir}" do
    system "git add ."
    system "git add -u"
    puts "\n## Commiting: Site updated at #{Time.now.utc}"
    message = "Site updated at #{Time.now.utc}"
    system "git commit -m \"#{message}\""
    puts "\n## Pushing generated #{deploy_dir} website"
    system "git push origin #{deploy_branch} --force"
    puts "\n## Github Pages deploy complete"
  end
end

desc "Update configurations to support publishing to root or sub directory"
task :set_root_dir, :dir do |t, args|
  puts ">>> !! Please provide a directory, eg. rake config_dir[publishing/subdirectory]" unless args.dir
  if args.dir
    if args.dir == "/"
      dir = ""
    else
      dir = "/" + args.dir.sub(/(\/*)(.+)/, "\\2").sub(/\/$/, '');
    end
    rakefile = IO.read(__FILE__)
    rakefile.sub!(/public_dir(\s*)=(\s*)(["'])[\w\-\/]*["']/, "public_dir\\1=\\2\\3public#{dir}\\3")
    File.open(__FILE__, 'w') do |f|
      f.write rakefile
    end
    compass_config = IO.read('config.rb')
    compass_config.sub!(/http_path(\s*)=(\s*)(["'])[\w\-\/]*["']/, "http_path\\1=\\2\\3#{dir}/\\3")
    compass_config.sub!(/http_images_path(\s*)=(\s*)(["'])[\w\-\/]*["']/, "http_images_path\\1=\\2\\3#{dir}/images\\3")
    compass_config.sub!(/http_fonts_path(\s*)=(\s*)(["'])[\w\-\/]*["']/, "http_fonts_path\\1=\\2\\3#{dir}/fonts\\3")
    compass_config.sub!(/css_dir(\s*)=(\s*)(["'])[\w\-\/]*["']/, "css_dir\\1=\\2\\3public#{dir}/stylesheets\\3")
    File.open('config.rb', 'w') do |f|
      f.write compass_config
    end
    jekyll_config = IO.read('_config.yml')
    jekyll_config.sub!(/^destination:.+$/, "destination: public#{dir}")
    jekyll_config.sub!(/^subscribe_rss:\s*\/.+$/, "subscribe_rss: #{dir}/atom.xml")
    jekyll_config.sub!(/^root:.*$/, "root: /#{dir.sub(/^\//, '')}")
    File.open('_config.yml', 'w') do |f|
      f.write jekyll_config
    end
    rm_rf public_dir
    mkdir_p "#{public_dir}#{dir}"
    puts "## Site's root directory is now '/#{dir.sub(/^\//, '')}' ##"
  end
end

desc "Set up _deploy folder and deploy branch for Github Pages deployment"
task :setup_github_pages, :repo do |t, args|
  if args.repo
    repo_url = args.repo
  else
    puts "Enter the read/write url for your repository" 
    puts "(For example, 'git@github.com:your_username/your_username.github.com)"
    repo_url = get_stdin("Repository url: ")
  end
  user = repo_url.match(/:([^\/]+)/)[1]
  branch = (repo_url.match(/\/[\w-]+.github.com/).nil?) ? 'gh-pages' : 'master'
  project = (branch == 'gh-pages') ? repo_url.match(/\/([^\.]+)/)[1] : ''
  unless `git remote -v`.match(/origin.+?octopress.git/).nil?
    # If octopress is still the origin remote (from cloning) rename it to octopress
    system "git remote rename origin octopress"
    if branch == 'master'
      # If this is a user/organization pages repository, add the correct origin remote
      # and checkout the source branch for committing changes to the blog source.
      system "git remote add origin #{repo_url}"
      puts "Added remote #{repo_url} as origin"
      system "git config branch.master.remote origin"
      puts "Set origin as default remote"
      system "git branch -m master source"
      puts "Master branch renamed to 'source' for committing your blog source files"
    else
      unless !public_dir.match("#{project}").nil?
        system "rake set_root_dir[#{project}]"
      end
    end
  end
  url = "http://#{user}.github.com"
  url += "/#{project}" unless project == ''
  jekyll_config = IO.read('_config.yml')
  jekyll_config.sub!(/^url:.*$/, "url: #{url}")
  File.open('_config.yml', 'w') do |f|
    f.write jekyll_config
  end
  rm_rf deploy_dir
  mkdir deploy_dir
  cd "#{deploy_dir}" do
    system "git init"
    system "echo 'My Octopress Page is coming soon &hellip;' > index.html"
    system "git add ."
    system "git commit -m \"Octopress init\""
    system "git branch -m gh-pages" unless branch == 'master'
    system "git remote add origin #{repo_url}"
    rakefile = IO.read(__FILE__)
    rakefile.sub!(/deploy_branch(\s*)=(\s*)(["'])[\w-]*["']/, "deploy_branch\\1=\\2\\3#{branch}\\3")
    rakefile.sub!(/deploy_default(\s*)=(\s*)(["'])[\w-]*["']/, "deploy_default\\1=\\2\\3push\\3")
    File.open(__FILE__, 'w') do |f|
      f.write rakefile
    end
  end
  puts "\n---\n## Now you can deploy to #{url} with `rake deploy` ##"
end

def ok_failed(condition)
  if (condition)
    puts "OK"
  else
    puts "FAILED"
  end
end

def get_stdin(message)
  print message
  STDIN.gets.chomp
end

def ask(message, valid_options)
  if valid_options
    answer = get_stdin("#{message} #{valid_options.to_s.gsub(/"/, '').gsub(/, /,'/')} ") while !valid_options.include?(answer)
  else
    answer = get_stdin(message)
  end
  answer
end

desc "list tasks"
task :list do
  puts "Tasks: #{(Rake::Task.tasks - [Rake::Task[:list]]).join(', ')}"
  puts "(type rake -T for more detail)\n\n"
end
