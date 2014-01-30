
    {% assign handle_content_result = handle_content_input %}

Handling links

    {% assign link_handles_input = handle_content_result %}
    {% include link_handles.html %}
    {% assign handle_content_result = link_handles_result %}

Transforming sidenotes:

    {% assign sidenotes_input = handle_content_result %}
    {% include tenkan/sidenotes.md %}

    {% for sidenote_id in sidenotes_ids %}
        {% capture sidenote_replace %}<span class="sidenote-wrapper"><a class="sidenote-context" href="#{{ sidenote_id }}" id="{{ sidenote_id }}">{{ sidenotes_contexts[forloop.index0] }}</a><span class="sidenote"><span class="sidenote-misc"> (</span>{{ sidenotes_contents[forloop.index0] }}<span class="sidenote-misc">)</span></span></span>{% endcapture %}
        {% assign handle_content_result = handle_content_result | replace:sidenotes_id_strings[forloop.index0],sidenote_replace %}
    {% endfor %}

Adding anchors to headers

    {% assign content_headers = handle_content_result | split:'<h' %}
    {% for content_header in content_headers offset:1 %}
        {% assign substr_input = content_header %}
        {% assign substr_index = 0 %}
        {% assign substr_length = 4 %}
        {% include tenkan/substr.md %}

        {% assign lolheaders = "2 id,3 id,4 id,5 id,6 id" | split:',' %}
        {% if lolheaders contains substr_result %}
            {% assign header_id = content_header | split:'>' | first %}
            {% assign thing_to_trim = header_id | truncate:6,'' %}
            {% assign header_id = header_id | remove_first:thing_to_trim | remove:'"' %}
            {% capture what_to_replace %}<h{{ thing_to_trim }}{{ header_id }}">{% endcapture %}
            {% capture replace_with %}{{ what_to_replace }}<a class="header-anchor" title="{{ site.loc | map: 'link_to_part' | map: lang }}" href="#{{ header_id }}"></a>{% endcapture %}
            {% assign handle_content_result = handle_content_result | replace_first:what_to_replace,replace_with %}
        {% endif %}
    {% endfor %}
