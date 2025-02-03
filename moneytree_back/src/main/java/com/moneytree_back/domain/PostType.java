package com.moneytree_back.domain;

public enum PostType {
    HOBBY,
    REAL_ESTATE;

    public static PostType fromString(String value){
        switch (value.toLowerCase()){
            case "hobby":
                return HOBBY;
            case "real-estate":
                return REAL_ESTATE;
            default:
                throw new IllegalArgumentException("Unknown PostType: " + value);
        }
    }

}
