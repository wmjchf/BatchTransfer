interface IResponse<T> {
  code: number;
  msg?: string;
  message?:string;
  data: T;
}
interface IPaginationResponse<T> {
  count: number;
  currentPage: string;
  rows: T[];
}

declare module "nextjs-toploader/app" {
  const useRouter: () => {
    /** @see https://next-intl.dev/docs/routing/navigation#userouter */
    push: (
      href: Parameters<
        (
          args: {
            href: [AppPathnames] extends [never]
              ?
                  | string
                  | {
                      pathname: string;
                      query?: import(".").QueryParams;
                    }
              : keyof AppPathnames extends infer T_1
              ? T_1 extends keyof AppPathnames
                ? T_1 extends `${string}[[...${string}`
                  ?
                      | T_1
                      | ({
                          pathname: T_1;
                          params?:
                            | import("../shared/StrictParams").default<T_1>
                            | undefined;
                        } & {
                          query?: import(".").QueryParams;
                        })
                  : T_1 extends `${string}[${string}`
                  ? {
                      pathname: T_1;
                      params: import("../shared/StrictParams").default<T_1>;
                    } & {
                      query?: import(".").QueryParams;
                    }
                  :
                      | T_1
                      | ({
                          pathname: T_1;
                        } & {
                          query?: import(".").QueryParams;
                        })
                : never
              : never;
            locale: string;
          } & (
            | ([AppPathnames] extends [never]
                ?
                    | RoutingConfigSharedNavigation<
                        AppLocales,
                        AppLocalePrefixMode,
                        AppDomains
                      >
                    | undefined
                : RoutingConfigLocalizedNavigation<
                    AppLocales,
                    AppLocalePrefixMode,
                    AppPathnames,
                    AppDomains
                  >)
            | undefined extends undefined
            ? {}
            : AppLocalePrefixMode extends "as-needed"
            ? [AppDomains] extends [never]
              ? {}
              : {
                  domain: AppDomains[number]["domain"];
                }
            : {})
        ) => string
      >[0]["href"],
      options?:
        | (Partial<
            import("next/dist/shared/lib/app-router-context.shared-runtime").NavigateOptions
          > & {
            locale?: string;
          })
        | undefined
    ) => void;
    /** @see https://next-intl.dev/docs/routing/navigation#userouter */
    replace: (
      href: Parameters<
        (
          args: {
            href: [AppPathnames] extends [never]
              ?
                  | string
                  | {
                      pathname: string;
                      query?: import(".").QueryParams;
                    }
              : keyof AppPathnames extends infer T_1
              ? T_1 extends keyof AppPathnames
                ? T_1 extends `${string}[[...${string}`
                  ?
                      | T_1
                      | ({
                          pathname: T_1;
                          params?:
                            | import("../shared/StrictParams").default<T_1>
                            | undefined;
                        } & {
                          query?: import(".").QueryParams;
                        })
                  : T_1 extends `${string}[${string}`
                  ? {
                      pathname: T_1;
                      params: import("../shared/StrictParams").default<T_1>;
                    } & {
                      query?: import(".").QueryParams;
                    }
                  :
                      | T_1
                      | ({
                          pathname: T_1;
                        } & {
                          query?: import(".").QueryParams;
                        })
                : never
              : never;
            locale: string;
          } & (
            | ([AppPathnames] extends [never]
                ?
                    | RoutingConfigSharedNavigation<
                        AppLocales,
                        AppLocalePrefixMode,
                        AppDomains
                      >
                    | undefined
                : RoutingConfigLocalizedNavigation<
                    AppLocales,
                    AppLocalePrefixMode,
                    AppPathnames,
                    AppDomains
                  >)
            | undefined extends undefined
            ? {}
            : AppLocalePrefixMode extends "as-needed"
            ? [AppDomains] extends [never]
              ? {}
              : {
                  domain: AppDomains[number]["domain"];
                }
            : {})
        ) => string
      >[0]["href"],
      options?:
        | (Partial<
            import("next/dist/shared/lib/app-router-context.shared-runtime").NavigateOptions
          > & {
            locale?: string;
          })
        | undefined
    ) => void;
    /** @see https://next-intl.dev/docs/routing/navigation#userouter */
    prefetch: (
      href: Parameters<
        (
          args: {
            href: [AppPathnames] extends [never]
              ?
                  | string
                  | {
                      pathname: string;
                      query?: import(".").QueryParams;
                    }
              : keyof AppPathnames extends infer T_1
              ? T_1 extends keyof AppPathnames
                ? T_1 extends `${string}[[...${string}`
                  ?
                      | T_1
                      | ({
                          pathname: T_1;
                          params?:
                            | import("../shared/StrictParams").default<T_1>
                            | undefined;
                        } & {
                          query?: import(".").QueryParams;
                        })
                  : T_1 extends `${string}[${string}`
                  ? {
                      pathname: T_1;
                      params: import("../shared/StrictParams").default<T_1>;
                    } & {
                      query?: import(".").QueryParams;
                    }
                  :
                      | T_1
                      | ({
                          pathname: T_1;
                        } & {
                          query?: import(".").QueryParams;
                        })
                : never
              : never;
            locale: string;
          } & (
            | ([AppPathnames] extends [never]
                ?
                    | RoutingConfigSharedNavigation<
                        AppLocales,
                        AppLocalePrefixMode,
                        AppDomains
                      >
                    | undefined
                : RoutingConfigLocalizedNavigation<
                    AppLocales,
                    AppLocalePrefixMode,
                    AppPathnames,
                    AppDomains
                  >)
            | undefined extends undefined
            ? {}
            : AppLocalePrefixMode extends "as-needed"
            ? [AppDomains] extends [never]
              ? {}
              : {
                  domain: AppDomains[number]["domain"];
                }
            : {})
        ) => string
      >[0]["href"],
      options?:
        | (Partial<
            import("next/dist/shared/lib/app-router-context.shared-runtime").PrefetchOptions
          > & {
            locale?: string;
          })
        | undefined
    ) => void;
    back(): void;
    forward(): void;
    refresh(): void;
  };
  export { useRouter };
}

declare module 'masonry-layout' {
  interface MasonryOptions {
    itemSelector?: string;
    columnWidth?: number | string | Element;
    gutter?: number;
    percentPosition?: boolean;
    originLeft?: boolean;
    originTop?: boolean;
    containerStyle?: Partial<CSSStyleDeclaration>;
    transitionDuration?: string;
    fitWidth?: boolean;
    stamp?: string;
    horizontalOrder?: boolean;
    initLayout?: boolean;
  }

  export default class Masonry {
    constructor(container: Element | string, options?: MasonryOptions);
    layout(): void;
    reloadItems(): void;
    destroy(): void;
    addItems(elements: Element | Element[]): void;
    remove(elements: Element | Element[]): void;
    stamp(elements: Element | Element[]): void;
    unstamp(elements: Element | Element[]): void;
    getItemElements(): Element[];
    on(eventName: string, listener: (...args: any[]) => void): void;
  }
}
