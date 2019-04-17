#/usr/bin/env bash

__kcals_complete_users()
{
    LIST=$(kcals __get_completion_users)
    COMPREPLY+=($(compgen -W "$LIST" "${COMP_WORDS[1]}"))
}

__kcals_complete()
{
    complete -F __kcals_complete_users $1
}

__kcals_complete kcals
