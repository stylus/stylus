{% capture setup_cache %}

Setting dev flag (on GitHub or with flag `--safe` it would be false)

    {% unless site.safe %}
        {% assign dev = true %}
    {% endunless %}

Including [Tenkan](https://github.com/kizu/tenkan)

    {% include tenkan/setup.md %}

Setting the easier title to processed one

    {% assign title = processed_title %}

Setting the greeting content if nothing there in `index.md`

    {% assign content_size = page.content | strip_newlines | size %}
    {% if page.permalink == '/' and content_size == 0 %}
        {% assign title = 'Greetings to Textyll setup!' %}
        {% capture processed_content %}{% include greetings.md %}{% endcapture %}
        {% assign processed_content = processed_content | markdownify %}
        {% assign toc_input = processed_content %}
    {% endif %}

Getting the language from the categories of url

    {% assign lang = site.default_lang %}

    {% for l in site.langs %}
        {% if l != site.default_lang %}
            {% capture lang_search_string %}/{{ l }}/{% endcapture %}
            {% if page.categories contains l or page.url contains lang_search_string %}
                {% assign lang = l %}
            {% endif %}
        {% endif %}
    {% endfor %}

Setting the lang prefix

    {% assign lang_prefix = '' %}
    {% if lang != site.default_lang %}
        {% capture lang_prefix %}{{ lang }}/{% endcapture %}
    {% endif %}

Handling content

    {% assign handle_content_input = processed_content %}
    {% include handle_content.md %}
    {% assign processed_content = handle_content_result %}


Looking if the page have a translation

    {% if lang == 'en' %}
        {% capture expected_translation_id %}{{ page.id | replace:'/en/','/' }}{% endcapture %}
    {% else %}
        {% capture expected_translation_id  %}/en{{ page.id }}{% endcapture %}
    {% endif %}

    {% assign posts_ids = site.posts | map:'id' %}

    {% if page.page_type != 'post' or posts_ids contains expected_translation_id %}
        {% assign page_have_translation = true %}
    {% endif %}

Capturing the main category

    {% assign page_category_class = '' %}
    {% if page.categories %}
        {% capture page_category_class %} page_{{ page.categories[0] }}{% endcapture %}
    {% endif %}

    {% for l in site.langs %}
        {% if page.categories[0] == l %}
            {% capture page_category_class %} page_{{ page.categories[1] }}{% endcapture %}
        {% endif %}
    {% endfor %}

Setting the page lang class

    {% assign page_lang_class = '' %}
    {% assign page_langs_count = site.langs | size %}
    {% if page_langs_count > 1 %}
        {% capture page_lang_class %} page_{{ lang }}{% endcapture %}
    {% endif %}

Setting the page type class

    {% assign page_type_class = '' %}
    {% capture index_test %}/{{ lang_prefix }}{% endcapture %}
    {% if page.permalink == index_test %}
        {% capture page_type_class %} page_index{% endcapture %}
        {% assign is_index = true %}
    {% endif %}
    {% if page.page_type_class %}
        {% capture page_type_class %} page_{{ page.page_type_class }}{% endcapture %}
    {% endif %}

Setting the root url:

    {% assign root_url = '/' %}
    {% if site.production_url %}
        {% capture test_ending_slash %}{{ site.production_url }}$$$end{% endcapture %}
        {% assign root_url = test_ending_slash | replace:'/$$$end','$$$end' | replace:'$$$end','/' %}
    {% elsif site.github_user %}
        {% capture root_url %}http://{{ site.github_user }}.github.io/textyll/{% endcapture %}
    {% elsif site.relative_urls_when_possible == true %}
        {% assign root_url = '' %}
        {% assign root_url_depth = page.url | split:'/' | size | minus:1 %}
        {% if root_url_depth > 0 %}
            {% for i in (1..root_url_depth) %}
                {% capture root_url %}../{{ root_url }}{% endcapture %}
            {% endfor %}
        {% endif %}
    {% endif %}

Setting the default toc:

    {% capture toc %}{% include toc.md %}{% endcapture %}

Setting the default partials:

    {% assign partials_input = page %}
    {% include tenkan/partials.md %}
    {% assign partials = partials_result %}

Setting the default partials toc:

    {% assign partials_toc = '' %}
    {% assign toc_input = partials %}
    {% include toc.md %}
    {% assign partials_toc = toc_result %}

Handling partials

    {% assign handle_content_input = partials %}
    {% include handle_content.md %}
    {% assign partials = handle_content_result %}

{% endcapture %}
