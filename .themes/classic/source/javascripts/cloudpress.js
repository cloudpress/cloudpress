---
---

{% include javascripts/modernizr-2.0.js %}
{% include javascripts/ender.js %}
{% include javascripts/octopress.js %}
{% include disqus.html %}
{% include facebook_like.html %}
{% include google_plus_one.html %}
{% include twitter_sharing.html %}

{% if site.delicious_user %}
    (function() {
        var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
        script.src = 'http://feeds.delicious.com/v2/json/{{ site.delicious_user }}?count={{ site.delicious_count }}&amp;sort=date&amp;callback=renderDeliciousLinks';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
    })();
{% endif %}

{% if site.github_user %}
    if (!window.jXHR){
        {% include javascripts/libs/jXHR.js %}
    }

    {% include javascripts/github.js %}

    github.showRepos({
        user: '{{site.github_user}}',
    count: {{site.github_repo_count}},
    skip_forks: {{site.github_skip_forks}},
    target: '#gh_repos'
    });
{% endif %}

{% if site.pinboard_user %}
    var linkroll = 'pinboard_linkroll'; //id target for pinboard list
    var pinboard_user = "{{ site.pinboard_user }}"; //id target for pinboard list
    var pinboard_count = {{ site.pinboard_count }}; //id target for pinboard list
(function(){
    var pinboardInit = document.createElement('script');
    pinboardInit.type = 'text/javascript';
    pinboardInit.async = true;
    pinboardInit.src = '{{ root_url }}/javascripts/pinboard.js';
    document.getElementsByTagName('head')[0].appendChild(pinboardInit);
})();
{% endif %}

{% if site.twitter_user %}
    {% include javascripts/twitter.js %}
    getTwitterFeed("{{site.twitter_user}}", {{site.twitter_tweet_count}}, {{site.twitter_show_replies}});
{% endif %}
