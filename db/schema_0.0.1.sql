
CREATE TABLE page (
    id integer NOT NULL,
    title character varying(255)
);

ALTER TABLE page OWNER TO wikiadmin;
GRANT ALL ON TABLE page TO wikiadmin;

CREATE SEQUENCE page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE page_id_seq OWNER TO wikiadmin;
ALTER SEQUENCE page_id_seq OWNED BY page.id;
ALTER TABLE ONLY page ALTER COLUMN id SET DEFAULT nextval('page_id_seq'::regclass);
GRANT ALL ON SEQUENCE page_id_seq TO wikiadmin;
