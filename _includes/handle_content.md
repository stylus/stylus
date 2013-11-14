
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
