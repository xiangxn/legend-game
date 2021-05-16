

export class Props {
    id: string = "0";
    name: string | null = null;
    img: string | null = null;
    amount: number = 0;
    info: any | null = null;
}

export class OpenInfo {
    time: string | null = null;
    address: string | null = null;
    props: Props | null = null;
    uuid: string = "";
}